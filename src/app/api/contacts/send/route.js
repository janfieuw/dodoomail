import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export async function POST(request) {
  const formData = await request.formData();
  const contactIds = formData.getAll("contactIds");

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
  const baseHtml = fs.readFileSync(htmlPath, "utf8");

  for (const contact of contacts) {
    const trackingId = randomUUID();
    const subject = "Eenvoudige tijdsregistratie voor KMO’s";

    const trackingPixel = `
      <img 
        src="${process.env.APP_URL}/api/track-open?id=${trackingId}" 
        width="1" 
        height="1" 
        alt=""
        style="width:1px;height:1px;border:0;opacity:0;" 
      />
    `;

    let html = baseHtml.replaceAll(
      "https://www.axoo.be",
      `${process.env.APP_URL}/api/track-click?id=${trackingId}&url=${encodeURIComponent(
        "https://www.axoo.be"
      )}`
    );

    html = html + trackingPixel;

    await prisma.mailSendLog.create({
      data: {
        contactId: contact.id,
        email: contact.email,
        subject,
        trackingId,
        status: "sent",
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: contact.email,
      subject,
      html,
    });

    await prisma.contact.update({
      where: { id: contact.id },
      data: {
        status: "verstuurd",
        lastSentAt: new Date(),
      },
    });
  }

  redirect("/mail/contacts");
}