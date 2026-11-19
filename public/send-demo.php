<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_SLASHES);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, ['error' => 'Method not allowed.']);
}

$rawBody = file_get_contents('php://input');
if ($rawBody === false || strlen($rawBody) > 32768) {
    respond(400, ['error' => 'Invalid request body.']);
}

$inquiry = json_decode($rawBody, true);
if (!is_array($inquiry)) {
    respond(400, ['error' => 'Invalid request body.']);
}

function cleanText(mixed $value, int $maxLength): string
{
    if (!is_string($value)) {
        return '';
    }

    $value = trim($value);
    if (preg_match_all('/./us', $value, $characters) === false) {
        return '';
    }

    return implode('', array_slice($characters[0], 0, $maxLength));
}

function stringField(array $data, string $key, int $maxLength): string
{
    return cleanText($data[$key] ?? '', $maxLength);
}

$name = stringField($inquiry, 'fullName', 100);
$email = stringField($inquiry, 'email', 254);
$company = stringField($inquiry, 'companyName', 120);
$phone = stringField($inquiry, 'phone', 30);
$description = stringField($inquiry, 'projectDescription', 5000);

if (
    preg_match_all('/./us', $name) < 2 ||
    !filter_var($email, FILTER_VALIDATE_EMAIL) ||
    preg_match_all('/./us', $description) < 10
) {
    respond(400, ['error' => 'Please provide a valid name, email, and project description.']);
}

$recipient = getenv('ZOHO_RECIPIENT_EMAIL') ?: 'trever@hypepensec.com';
$sender = getenv('DEMO_MAIL_FROM') ?: (getenv('ZOHO_MAIL_USER') ?: '');
if (!filter_var($recipient, FILTER_VALIDATE_EMAIL) || !filter_var($sender, FILTER_VALIDATE_EMAIL)) {
    error_log('Get Demo email is not configured: set ZOHO_RECIPIENT_EMAIL and DEMO_MAIL_FROM.');
    respond(500, ['error' => 'Email delivery is not configured. Please contact us directly.']);
}

$services = $inquiry['selectedServices'] ?? [];
if (!is_array($services)) {
    $services = [];
}
$services = array_values(array_filter(
    array_map(
        static fn ($service): string => cleanText($service, 100),
        $services
    ),
    static fn (string $service): bool => $service !== ''
));
$platforms = $inquiry['platforms'] ?? [];
if (!is_array($platforms)) {
    $platforms = [];
}
$platforms = array_values(array_filter(
    array_map(static fn ($platform): string => cleanText($platform, 50), $platforms),
    static fn (string $platform): bool => $platform !== ''
));
$weeksMin = is_numeric($inquiry['estimatedWeeksMin'] ?? null)
    ? (string) max(0, (int) $inquiry['estimatedWeeksMin'])
    : 'Not provided';
$weeksMax = is_numeric($inquiry['estimatedWeeksMax'] ?? null)
    ? (string) max(0, (int) $inquiry['estimatedWeeksMax'])
    : 'Not provided';

$lines = [
    'New Get Demo request received from the Trever website.',
    '',
    'Name: ' . $name,
    'Email: ' . $email,
    'Company: ' . ($company !== '' ? $company : 'Not provided'),
    'Phone: ' . ($phone !== '' ? $phone : 'Not provided'),
    'Services: ' . ($services !== [] ? implode(', ', $services) : 'Not provided'),
    'Complexity: ' . $stringField($inquiry, 'complexity', 40),
    'Platforms: ' . ($platforms !== [] ? implode(', ', $platforms) : 'Not provided'),
    'Estimated delivery: ' . $weeksMin . ' - ' . $weeksMax . ' weeks',
    'Estimated budget: ' . stringField($inquiry, 'estimatedCostRange', 60),
    'Recommended team: ' . stringField($inquiry, 'recommendedTeamSummary', 300),
    '',
    'Project brief:',
    $description,
];

$headers = [
    'From: Trever Website <' . $sender . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
];

if (!mail($recipient, 'New Trever Get Demo request', implode("\r\n", $lines), implode("\r\n", $headers))) {
    error_log('PHP mail() failed to send a Get Demo notification.');
    respond(500, ['error' => 'We could not send your demo request. Please try again later.']);
}

respond(200, ['ok' => true]);
