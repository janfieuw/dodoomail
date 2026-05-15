"use server";

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export async function sendTestMail(formData) {
  const to = formData.get("to");

  const templatePath = path.join(process.cwd(), "template", "index.html");
  let html = fs.readFileSync(templatePath, "utf8");

  html = html.replaceAll(
    'src="head.png"',
    'src="cid:headimage"'
  );

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "Testmail Axoo",
    html,
    attachments: [
      {
        filename: "head.png",
        path: path.join(process.cwd(), "template", "head.png"),
        cid: "headimage",
      },
    ],
  });

  return { success: true };
}