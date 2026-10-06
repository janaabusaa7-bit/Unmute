<?php
require_once __DIR__ . '/mail_config.php';

function sendPlatformEmail($toEmail, $toName, $subject, $bodyHtml) {
    if (!defined('MAIL_ENABLED') || MAIL_ENABLED !== true) {
        return [
            "success" => false,
            "message" => "Email sending is disabled."
        ];
    }

    $payload = [
        "sender" => [
            "name"  => MAIL_FROM_NAME,
            "email" => MAIL_FROM_EMAIL
        ],
        "to" => [
            [
                "email" => $toEmail,
                "name"  => $toName
            ]
        ],
        "subject" => $subject,
        "htmlContent" => $bodyHtml
    ];

    $headers = [
        "Content-Type: application/json",
        "Accept: application/json",
        "api-key: " . BREVO_API_KEY
    ];

    $context = stream_context_create([
        "http" => [
            "method"  => "POST",
            "header"  => implode("\r\n", $headers),
            "content" => json_encode($payload),
            "timeout" => 30,
            "ignore_errors" => true
        ]
    ]);

    $response = @file_get_contents(
        "https://api.brevo.com/v3/smtp/email",
        false,
        $context
    );

    $statusCode = 0;
    if (isset($http_response_header) && is_array($http_response_header)) {
        foreach ($http_response_header as $headerLine) {
            if (preg_match('#HTTP/\S+\s+(\d{3})#', $headerLine, $matches)) {
                $statusCode = (int)$matches[1];
                break;
            }
        }
    }

    if ($response === false) {
        return [
            "success" => false,
            "message" => "Request failed while connecting to Brevo."
        ];
    }

    if ($statusCode >= 200 && $statusCode < 300) {
        return [
            "success" => true,
            "message" => "Email sent successfully."
        ];
    }

    return [
        "success" => false,
        "message" => "Brevo API error: " . $response
    ];
}