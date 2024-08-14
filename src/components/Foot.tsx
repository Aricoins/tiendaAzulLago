import Link from "next/link";
import { Input, Button } from "antd";

const Foot = () => {
    return (
        <footer className="bg-black text-white py-10">
            <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="flex flex-col items-center md:items-start">
                    <h4 className=" mb-4 text-sky-500">Dónde estamos</h4>
                    <p className="mb-2 flex items-center">
                        <i className="fa fa-map-marker-alt mr-3"></i>
                        Las Mutisias 127, Frente al Skate Park, Lago Puelo, Chubut, ARG
                    </p>
                    <p className="mb-2 flex items-center">
                        <i className="fa fa-phone-alt mr-3"></i>
                        +54 9 2944 62-9470 | 294 4245088 | 294 4598520
                    </p>
                    <p className="mb-2 flex items-center">
                        <i className="fa fa-envelope mr-3"></i>
                        <Link href="mailto:azullagocoop@gmail.com">azullagocoop@gmail.com</Link>
                    </p>
                </div>
                
                <div className="flex flex-col items-center md:items-start">
                    <h4 className="text-sky-500 mb-4">Links rápidos</h4>
                    <div className="flex flex-col space-y-2">
                        <Link href="https://azullago.com" className="text-white hover:underline">Acerca de</Link>
                        <Link href="https://azullago.com#contacto" className="text-white hover:underline">Contacto</Link>
                        <Link href="https://azullago.com#empresas-socias" className="text-white hover:underline">Empresas Socias</Link>
                        <Link href="https://azullago.com#terminos" className="text-white hover:underline">Términos y Condiciones</Link>
                        <Link href="mailto:azullagocoop@gmail.com?subject=Soporte" className="text-white hover:underline">Soporte</Link>
                    </div>
                </div>
                
                <div className="flex flex-col items-center md:items-start">
                    <h4 className="text-sky-500 mb-4">Newsletter</h4>
                    <p>¡Suscríbete para recibir nuestras últimas noticias y novedades!</p>
                    <div className="relative w-full mt-4">
                        <Input className="py-2" placeholder="Tu correo electrónico" />
                        <Button type="primary" className="mt-2 w-full">Enviar</Button>
                    </div>
                </div>
            </div>
            <div className="container mx-auto mt-10 text-center border-t border-gray-600 pt-5">
                <p>&copy; <Link href="https://azullago.com" className="text-white hover:underline">Azul Lago Cooperativa</Link>, Todos los derechos reservados.</p>
                <p>Diseño y desarrollo <Link href="https://www.latitud42.tech/" className="text-white hover:underline">Latitud42.tech</Link></p>
            </div>
        </footer>
    );
};

export default Foot;
