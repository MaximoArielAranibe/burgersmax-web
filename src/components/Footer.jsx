import '../styles/footer.scss'
import logo from "../assets/BURGUERS-MAX-NEGATIVO.png"
import WhatsappVerde from './WhatsappVerdeIcon'

const Footer = () => {
  return (
    <footer className='footer'>
      {/* Brand */}
      <div className="footer__row footer__row__brand">
        <img src={logo} className='footer__row__brand__img' alt="burgersmax_logo" />
        <div className="footer__row__content">
          <h4>BURGERSMAX</h4>
          <p>Hamburguesas con tapa de asado</p>
          <p>🔥 ¡Las mejores de Pergamino!</p>
        </div>
      </div>

      {/* Contacto */}
      <div className="footer__row footer__row__contact">
        <div className="footer__row__content">
          <h4>Hacenos tu pedido</h4>
          <p><strong>📞 Tel/WhatsApp:</strong> +54 9 2477 451081</p>
          <p><strong>⏰ Horarios:</strong> Jueves a Domingo 20:00 a 23:30</p>
        </div>
      </div>

      {/* Ubicación */}
      <div className="footer__row footer__row__about">
        <div className="footer__row__content">
          <h4>Encontranos</h4>
          <p>Pergamino, Buenos Aires</p>
          <p>Envíos a domicilio 🚗💨</p>
        </div>
      </div>

      {/* Redes sociales */}
      <div className="footer__row footer__row__social">
        <div className="footer__row__content">
          <h4>Seguinos</h4>
          <p>
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">📸 Instagram</a>
          </p>
          <p>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">📘 Facebook</a>
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
