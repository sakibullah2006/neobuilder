
import { sendEmail } from "./email";

export const sendInvitationEmail = async ({
    email,
    invitedByUsername,
    invitedByEmail,
    teamName,
    inviteLink,
}: {
    email: string;
    invitedByUsername: string;
    invitedByEmail: string;
    teamName: string;
    inviteLink: string;
}) => {
    const subject = `You've been invited to join ${teamName} on NeoBuilder`;
    const text = `${invitedByUsername} (${invitedByEmail}) has invited you to join the organization ${teamName} on NeoBuilder. Click here to accept the invitation: ${inviteLink}`;

    // Simple HTML template for the invitation email
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>You've been invited to join ${teamName}</h2>
            <p><strong>${invitedByUsername}</strong> (<a href="mailto:${invitedByEmail}">${invitedByEmail}</a>) has invited you to join the organization <strong>${teamName}</strong> on NeoBuilder.</p>
            <br/>
            <a href="${inviteLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accept Invitation</a>
            <br/><br/>
            <p style="color: #666; font-size: 14px;">If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="color: #666; font-size: 14px; word-break: break-all;">${inviteLink}</p>
        </div>
    `;

    return await sendEmail({ to: email, subject, text, html });
};
