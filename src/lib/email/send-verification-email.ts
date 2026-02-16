import { sendEmail } from "./email";

export const sendVerificationEmail = async ({
    to,
    url,
}: {
    to: string;
    url: string;
}) => {
    const subject = "Verify your email address";
    const text = `Please verify your email address by clicking the following link: ${url}`;
    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify your email</h2>
            <p>Please click the button below to verify your email address.</p>
            <a href="${url}" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
            <p>If the button doesn't work, you can copy this link:</p>
            <p>${url}</p>
        </div>
    `;

    return await sendEmail({ to, subject, text, html });
};

