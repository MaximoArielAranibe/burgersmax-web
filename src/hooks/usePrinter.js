export const usePrinter = () => {
  const print = async (pedido) => {
    try {
      const res = await fetch('http://localhost:3001/print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pedido)
      });

      if (!res.ok) throw new Error('Error al imprimir');

    } catch (error) {
      console.error(error);
    }
  };

  return { print };
};