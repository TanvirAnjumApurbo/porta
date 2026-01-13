interface EmailProps {
  to: string;
  templateParams: Record<string, string>;
}

export async function sendEmail({ to, templateParams }: EmailProps) {
  try {
    const serviceId = process.env.EMAILJS_SERVICE_ID || process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
    const templateId = process.env.EMAILJS_TEMPLATE_ID || process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
    const publicKey = process.env.EMAILJS_PUBLIC_KEY || process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
    const privateKey = process.env.EMAILJS_PRIVATE_KEY || process.env.NEXT_PUBLIC_EMAILJS_PRIVATE_KEY;

    if (!serviceId || !templateId || !publicKey || !privateKey) {
      console.warn("EmailJS environment variables are missing. Email not sent.");
      console.warn("Checked for normal and NEXT_PUBLIC_ prefixes.");
      return { success: false, error: "Missing Env Vars" };
    }

    console.log("Attempting to send email via EmailJS...");
    console.log("To:", to);
    
    // EmailJS Send API
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
            ...templateParams,
            to_email: to, // Ensure this matches the variable in your EmailJS template "To Email" field
            reply_to: "noreply@porta.app",
        },
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("EmailJS API Error:", errorText);
        return { success: false, error: errorText };
    }

    console.log("EmailJS API Response: OK");
    return { success: true };
  } catch (error) {
    console.error("Error sending email via EmailJS:", error);
    return { success: false, error };
  }
}

export async function sendProductPurchasedEmail(
    to: string, 
    customerName: string, 
    travelerName: string, 
    productName: string,
    requestId: string
) {
    const message = `Great news! ${travelerName} has confirmed they have purchased your requested item: ${productName}. The next step is delivery.`;
    
    return sendEmail({
        to,
        templateParams: {
            title: "Product Purchased! 🛍️",
            message: message,
            customer_name: customerName, // Keep specific ones just in case
            request_link: `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
        }
    });
}

export async function sendDeliveryOTPEmail(
    to: string,
    customerName: string,
    otpCode: string,
    requestId: string
) {
    const message = `Your delivery verification code is: ${otpCode}. Please provide this code to the traveler ONLY when you have received your item.`;

    return sendEmail({
        to,
        templateParams: {
            title: "Your Delivery Code 🔐",
            message: message,
            customer_name: customerName,
            request_link: `${process.env.NEXT_PUBLIC_APP_URL}/requests/${requestId}`,
        }
    });
}
