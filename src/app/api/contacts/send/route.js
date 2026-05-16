import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function POST(request) {
  const formData = await request.formData();

  const contactIds = formData
  .getAll("contactIds")
  .map((id) => Number(id));

  if (!contactIds.length) {
    redirect("/mail/contacts");
  }

const contacts = await prisma.contact.findMany({
  where: {
    id: {
      in: contactIds,
    },
  },
});

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlPath = path.join(process.cwd(), "mail-template.html");
  let html = fs.readFileSync(htmlPath, "utf8");

  for (const contact of contacts) {
    const trackingId = randomUUID();

    await prisma.mailSendLog.create({
      data: {
        contactId: contact.id,
        trackingId,
      },
    });

    const trackingPixel = `
      <img 
        src="${process.env.APP_URL}/api/track-open?id=${trackingId}" 
        width="1" 
        height="1" 
        style="display:none;" 
      />
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: contact.email,
      subject: "Eenvoudige tijdsregistratie voor KMO’s",
      html: html + trackingPixel,
    });

    await prisma.contact.update({
      where: { id: contact.id },
      data: { status: "verstuurd" },
    });
  }

  redirect("/mail/contacts");
}