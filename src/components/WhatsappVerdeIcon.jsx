import WhatsappVerdeIcon from '../assets/whatsapp-svgrepo-com-verde.svg';
import '../styles/whatsapp.scss'

// eslint-disable-next-line react/prop-types
const WhatsappVerde = ({ ancho = '35px', alto = '35px' }) => {
  // Define tu mensaje personalizado
  const mensajePersonalizado = "¡Hola! Me gustaria hacer un pedido.";

  // Codifica el mensaje para la URL (es una buena práctica)
  const mensajeCodificado = encodeURIComponent(mensajePersonalizado);

  // Construye el enlace de WhatsApp con el mensaje
  const numeroWhatsApp = "5492477451081";
  const enlaceWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`;

  return (
    <a
      href={enlaceWhatsApp} // Usa la variable con el mensaje codificado
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp"
    >
      <img
        className='whatsapp__icon'
        src={WhatsappVerdeIcon}
        alt="WhatsApp Icon"
        width={ancho}
        height={alto}
      />
    </a>
  )
}

export default WhatsappVerde