<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $title ?? 'Report' }}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            margin: 0;
            padding: 0;
            background: #f8fafc;
        }
        .report-container {
            padding: 30px;
            width: 100%;
            box-sizing: border-box;
        }
        .report-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .report-header h1 {
            margin: 0;
            font-size: 24px;
        }
        .report-meta {
            text-align: right;
            font-size: 12px;
            line-height: 1.6;
            color: #6b7280;
        }
        .report-section {
            margin-bottom: 24px;
        }
        .report-section h2 {
            margin: 0 0 12px;
            font-size: 18px;
            color: #111827;
        }
        .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 16px;
        }
        .card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 18px;
        }
        .metric-title {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            margin-bottom: 10px;
        }
        .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: #111827;
        }
        .metric-subtitle {
            font-size: 12px;
            color: #6b7280;
            margin-top: 8px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
        }
        .table th, .table td {
            padding: 12px 14px;
            border-bottom: 1px solid #eff2f7;
        }
        .table th {
            text-align: left;
            background: #f8fafc;
            color: #374151;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .table td {
            font-size: 12px;
            color: #374151;
        }
        .badge {
            display: inline-flex;
            padding: 6px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.04em;
        }
        .badge-green { background: #ecfdf5; color: #166534; }
        .badge-amber { background: #fffbeb; color: #92400e; }
        .badge-red { background: #fef2f2; color: #991b1b; }
        .footer {
            margin-top: 40px;
            font-size: 11px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
        }
    </style>
</head>
<body>
    <div class="report-container">
        <div class="report-header">
            <div>
                <h1>{{ $title ?? 'Report' }}</h1>
                <p style="margin: 8px 0 0; color: #6b7280; font-size: 13px;">Fraud Detection and Management System</p>
            </div>
            <div class="report-meta">
                <div>{{ now()->format('F j, Y') }}</div>
                <div>{{ $dateRange ?? 'All time' }}</div>
            </div>
        </div>

        @yield('content')

        <div class="footer">
            Generated at {{ now()->format('F j, Y H:i') }} · Confidential fraud operations report.
        </div>
    </div>
</body>
</html>
