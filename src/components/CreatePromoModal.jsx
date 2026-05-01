import { useState } from "react";
import "../styles/CreatePromoModal.scss";

const CreatePromoModal = ({ onClose, onSave, initialData }) => {

  const toNumber = (v) => Number(v || 0);

  const [form, setForm] = useState(() => {
    if (!initialData) {
      return {
        nombre: "",
        precio: "",
        thumbnail: "",

        burgers: "",
        medallones: "",

        papas_ind: "",
        papas_bandeja: "",
        papas_bandeja_cheddar: "",
        papas_bandeja_cheddar_panceta: "",

        milanesa_pollo: "",
        milanesa_carne: "",

        lomos: "",
        helados: "",
      };
    }

    return {
      nombre: initialData.nombre || "",
      precio: initialData.precio || "",
      thumbnail: initialData.thumbnail || "",

      burgers: initialData.stats?.burgers || "",
      medallones: initialData.stats?.medallones || "",

      papas_ind: initialData.stats?.papas_ind || "",
      papas_bandeja: initialData.stats?.papas_bandeja || "",
      papas_bandeja_cheddar: initialData.stats?.papas_bandeja_cheddar || "",
      papas_bandeja_cheddar_panceta: initialData.stats?.papas_bandeja_cheddar_panceta || "",

      milanesa_pollo: initialData.stats?.milanesa_pollo || "",
      milanesa_carne: initialData.stats?.milanesa_carne || "",

      lomos: initialData.stats?.lomos || "",
      helados: initialData.stats?.helados || "",
    };
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave({
      nombre: form.nombre,
      precio: toNumber(form.precio),
      thumbnail: form.thumbnail,

      stats: {
        burgers: toNumber(form.burgers),
        medallones: toNumber(form.medallones),

        papas_ind: toNumber(form.papas_ind),
        papas_bandeja: toNumber(form.papas_bandeja),
        papas_bandeja_cheddar: toNumber(form.papas_bandeja_cheddar),
        papas_bandeja_cheddar_panceta: toNumber(form.papas_bandeja_cheddar_panceta),

        milanesa_pollo: toNumber(form.milanesa_pollo),
        milanesa_carne: toNumber(form.milanesa_carne),

        lomos: toNumber(form.lomos),
        helados: toNumber(form.helados),
      },
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>

        <h2>{initialData ? "Editar Promo" : "Crear Promo"}</h2>

        <form onSubmit={handleSubmit}>

          <input
            name="nombre"
            placeholder="Nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />

          <input
            name="precio"
            type="number"
            placeholder="Precio"
            value={form.precio}
            onChange={handleChange}
            required
          />

          <input
            name="thumbnail"
            placeholder="Imagen URL"
            value={form.thumbnail}
            onChange={handleChange}
          />

          <div className="modal-stats">

            <input name="burgers" type="number" placeholder="Burgers" value={form.burgers} onChange={handleChange} />
            <input name="medallones" type="number" placeholder="Medallones" value={form.medallones} onChange={handleChange} />

            <input name="papas_ind" type="number" placeholder="Papas ind" value={form.papas_ind} onChange={handleChange} />
            <input name="papas_bandeja" type="number" placeholder="Papas bandeja" value={form.papas_bandeja} onChange={handleChange} />

            <input name="papas_bandeja_cheddar" type="number" placeholder="Cheddar" value={form.papas_bandeja_cheddar} onChange={handleChange} />
            <input name="papas_bandeja_cheddar_panceta" type="number" placeholder="Cheddar + panceta" value={form.papas_bandeja_cheddar_panceta} onChange={handleChange} />

            <input name="milanesa_pollo" type="number" placeholder="Milanesa pollo" value={form.milanesa_pollo} onChange={handleChange} />
            <input name="milanesa_carne" type="number" placeholder="Milanesa carne" value={form.milanesa_carne} onChange={handleChange} />

            <input name="lomos" type="number" placeholder="Lomos" value={form.lomos} onChange={handleChange} />
            <input name="helados" type="number" placeholder="Helados" value={form.helados} onChange={handleChange} />

          </div>

          <div className="modal-actions">
            <button type="submit">Guardar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default CreatePromoModal;