'use server';

import { Resend } from 'resend';

const resendClient = new Resend(process.env.RESEND_API_KEY);

const fromEmail = 'PostIt <admin@mail.thinkroman.com>';
const replyTo = 'admin@mail.thinkroman.com';

export const sendMagicLinkEmail = async (
  email: string,
  name: string,
  magicLink: string
) => {
  try {
    const appName = 'PostIt';

    const logoUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/images/postit-logo.png`
      : 'https://kooldhar.thinkroman.com/images/postit-logo.png';

    await resendClient.emails.send({
      from: fromEmail,
      to: email,
      replyTo: replyTo,
      subject: `${appName} - Complete Your Account Setup`,
      html: `<!DOCTYPE html>
          <html lang="en">
          <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>${appName} - Account Setup</title>
              <style>
                  body {
                      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
                      line-height: 1.6;
                      color: #333333;
                      margin: 0;
                      padding: 0;
                      background-color: #f4f7f6;
                  }
                  .container {
                      max-width: 580px;
                      margin: 20px auto;
                      padding: 0 15px;
                  }
                  .email-wrapper {
                      background-color: #ffffff;
                      border-radius: 10px;
                      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
                      padding: 30px;
                      border-top: 5px solid #007bff;
                  }
                  .logo {
                      text-align: center;
                      margin-bottom: 25px;
                  }
                  .logo img {
                      max-height: 55px;
                  }
                  .content {
                      text-align: center;
                  }
                  h1 {
                      color: #0056b3;
                      font-size: 24px;
                      font-weight: 600;
                      margin-top: 0;
                      margin-bottom: 15px;
                  }
                  .greeting {
                      font-size: 18px;
                      margin-bottom: 20px;
                      color: #333333;
                  }
                  .message {
                      margin-bottom: 20px;
                      font-size: 16px;
                      color: #555555;
                  }
                  .magic-link-wrapper {
                      margin: 30px 0;
                  }
                  .magic-link-button {
                      display: inline-block;
                      background-color: #007bff;
                      color: #ffffff !important;
                      text-decoration: none;
                      padding: 15px 30px;
                      font-size: 16px;
                      font-weight: 600;
                      border-radius: 8px;
                      border: none;
                      transition: background-color 0.3s ease;
                  }
                  .magic-link-button:hover {
                      background-color: #0056b3;
                  }
                  .alternative-link {
                      margin-top: 20px;
                      font-size: 14px;
                      color: #777777;
                  }
                  .alternative-link a {
                      color: #007bff;
                      word-break: break-all;
                  }
                  .expiry-message {
                      font-size: 14px;
                      color: #777777;
                      margin-top: 15px;
                  }
                  .footer {
                      text-align: center;
                      font-size: 12px;
                      color: #888888;
                      margin-top: 30px;
                      padding-top: 20px;
                      border-top: 1px solid #eaeaea;
                  }
                  .footer p {
                      margin: 5px 0;
                  }
                  .app-name {
                      font-weight: bold;
                  }
                  .security-notice {
                      background-color: #fff3cd;
                      border: 1px solid #ffeaa7;
                      border-radius: 6px;
                      padding: 15px;
                      margin-top: 20px;
                      font-size: 14px;
                      color: #856404;
                  }
              </style>
          </head>
          <body>
              <div class="container">
                  <div class="email-wrapper">
                      <div class="logo">
                          <img src="${logoUrl}" alt="${appName} Logo">
                      </div>
                      <div class="content">
                          <h1>Complete Your Account Setup</h1>
                          <p class="greeting">Hi ${name},</p>
                          <p class="message">Welcome to <span class="app-name">${appName}</span>! Please click the button below to set your password and complete your account setup:</p>
                          
                          <div class="magic-link-wrapper">
                              <a href="${magicLink}" class="magic-link-button">Set Up Your Account</a>
                          </div>
                          
                          <div class="security-notice">
                              <strong>Security Note:</strong> If you didn't expect this email or didn't request an account, you can safely ignore this message. Your security is important to us.
                          </div>
                      </div>
                      <div class="footer">
                          <p>Best regards,</p>
                          <p>The ${appName} Team</p>
                          <p>© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
                      </div>
                  </div>
              </div>
          </body>
          </html>`,
    });
    console.log(`Magic link email sent successfully to ${email}`);
    return { success: true };
  } catch (error) {
    console.error(`Failed to send magic link email to ${email}:`, error);
    return { success: false, error };
  }
};

export const sendTeamInviteEmail = async (
  email: string,
  inviterName: string,
  inviteLink: string,
  profileNames?: string[]
) => {
  try {
    const appName = 'PostIt';
    const logoUrl = process.env.NEXT_PUBLIC_BASE_URL
      ? `${process.env.NEXT_PUBLIC_BASE_URL}/images/postit-logo.png`
      : 'https://kooldhar.thinkroman.com/images/postit-logo.png';

    const profilesList =
      profileNames && profileNames.length
        ? `<p style="margin:8px 0 0 0; font-size:14px; color:#555;">Profiles:</p><ul style="margin-top:6px; color:#555;">${profileNames
            .map(p => `<li>${p}</li>`)
            .join('')}</ul>`
        : '';

    await resendClient.emails.send({
      from: fromEmail,
      to: email,
      replyTo,
      subject: `${appName} - Team Invitation`,
      html: `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${appName} - Team Invitation</title>
      </head>
      <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background:#f4f7f6; margin:0; padding:0;">
        <div style="max-width:580px;margin:20px auto;padding:0 15px;">
          <div style="background:#fff;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.07);padding:30px;border-top:5px solid #007bff;">
            <div style="text-align:center;margin-bottom:25px;">
              <img src="${logoUrl}" alt="${appName} Logo" style="max-height:55px;" />
            </div>
            <div style="text-align:left;">
              <h1 style="color:#0056b3;font-size:24px;font-weight:600;margin:0 0 12px;">You're invited to a team</h1>
              <p style="font-size:16px;color:#555;">${inviterName} has added you to their team on <strong>${appName}</strong>.</p>
              ${profilesList}
              <div style="margin:24px 0; text-align:center;">
                <a href="${inviteLink}" style="display:inline-block;background:#007bff;color:#fff !important;text-decoration:none;padding:12px 22px;font-size:15px;font-weight:600;border-radius:8px;">Accept Invitation</a>
              </div>
              <p style="font-size:14px;color:#777;">If you don't have an account yet, you'll be asked to sign up first, and then you'll be redirected back to accept the invitation.</p>
            </div>
            <div style="text-align:center;font-size:12px;color:#888;margin-top:30px;padding-top:20px;border-top:1px solid #eaeaea;">
              <p style="margin:5px 0;">© ${new Date().getFullYear()} ${appName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>`,
    });
    return { success: true };
  } catch (error) {
    console.error(`Failed to send team invite email to ${email}:`, error);
    return { success: false, error };
  }
};
