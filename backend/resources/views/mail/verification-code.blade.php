<!DOCTYPE html>
<html lang="{{ $lang }}" dir="{{ $rtl ? 'rtl' : 'ltr' }}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{ $t['subject'] }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2fa;font-family:Arial,Helvetica,sans-serif;color:#1e1b2e;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2fa;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#4c1d95;padding:20px 28px;color:#ffffff;font-size:22px;font-weight:bold;" dir="ltr">EinStein</td>
        </tr>
        <tr>
          <td style="padding:28px;text-align:{{ $rtl ? 'right' : 'left' }};">
            <p style="margin:0 0 12px;font-size:18px;font-weight:bold;">{{ $t['hello'] }}</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">{{ $t['intro'] }}</p>
            <p dir="ltr" style="margin:0 0 20px;text-align:center;font-size:34px;font-weight:bold;letter-spacing:8px;color:#4c1d95;background:#f4f2fa;border-radius:12px;padding:16px 0;">{{ $code }}</p>
            <p style="margin:0 0 8px;font-size:14px;color:#55506a;">{{ $t['valid'] }}</p>
            <p style="margin:0;font-size:13px;color:#8a8599;">{{ $t['ignore'] }}</p>
          </td>
        </tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;color:#8a8599;" dir="ltr">EinStein Dienstleistung · Frankfurt am Main</p>
    </td>
  </tr>
</table>
</body>
</html>
