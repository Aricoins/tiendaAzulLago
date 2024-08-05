import { NextApiRequest, NextApiResponse } from 'next';
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar MercadoPago
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { cartItems }: { cartItems: CartItem[] } = req.body;
      console.log("Received cart items:", cartItems);

      const items = cartItems.map(item => ({
        id: item.id,
        title: item.name,
        quantity: item.qty,
        unit_price: Number(item.price)
      }));

      console.log("Preference items to create:", items);

      const preference = new Preference(client);
      
      const preferenceResponse = await preference.create({
        items: items,
        back_urls: {
          "success": "http://localhost:3000/feedback",
          "failure": "http://localhost:3000/feedback",
          "pending": "http://localhost:3000/feedback"
        },
        auto_return: "approved",
      });

      console.log("Created preference response:", preferenceResponse);

      res.status(200).json({ preferenceId: preferenceResponse.body.id });
    } catch (error) {
      console.error('Error creating preference:', error);
      res.status(500).json({ message: 'Error creating preference' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
