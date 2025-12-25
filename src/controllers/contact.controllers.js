import { sendContactEmails } from '../utils/email.utils.js';

export async function showContactPage(req, res) {
  try {
    res.render("contact", {
      title: "Contact Us",
      admin: req.session.admin || null
    });
  } catch (err) {
    console.error("CONTACT PAGE ERROR:", err);
    req.flash("error", "Something went wrong.");
    return res.redirect("/");
  }
}

export async function handleContactForm(req, res) {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      req.flash("error", "All fields are required.");
      return res.redirect("/contact");
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash("error", "Please enter a valid email address.");
      return res.redirect("/contact");
    }
    
    const contactData = { name, email, phone, subject, message };
    
    // Send emails
    const emailResults = await sendContactEmails(contactData);
    
    // Check if at least admin email was sent
    if (emailResults.adminEmail.success) {
      req.flash("success", "Thank you! Your message has been sent. We'll get back to you soon.");
    } else {
      // Fallback to console logging if email fails
      console.log("Contact Form Submission (Email Failed):", contactData);
      req.flash("success", "Thank you! Your message has been received. We'll get back to you soon.");
    }
    
    return res.redirect("/contact");
    
  } catch (err) {
    console.error("CONTACT FORM ERROR:", err);
    req.flash("error", "Failed to send message. Please try again.");
    return res.redirect("/contact");
  }
}
