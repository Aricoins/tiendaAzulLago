import { serialize } from 'cookie';

export default (req, res) => {
  // Configurar la cookie con SameSite=None y Secure
  const cookie = serialize('myCookieName', 'myCookieValue', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'None',
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ message: 'Cookie set' });
};
