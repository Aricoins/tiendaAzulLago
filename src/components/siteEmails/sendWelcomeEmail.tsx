import { compileWelcomeEmail } from "../../components/siteEmails/WelcomeEmail"

export default async function sendEMail(userName: string, email: string) {
    const myaccount = typeof window !== 'undefined' ? `${window.location.origin}/` : '';
  const products = typeof window !== 'undefined' ? `${window.location.origin}/product` : '';
    const emailmessage = compileWelcomeEmail(userName, myaccount, products)
    const emailData = {
            subject: `Bienvenido ${userName} a Azul Lago Tienda!`,
            emailTo: email,
            message: emailmessage,
          }

          fetch("/api/mailcarrier", {
            method: "POST",
            body: JSON.stringify(emailData)
          })  
}