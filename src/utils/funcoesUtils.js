export const criarFiltro = (campo) => {
    return (valor) => (objeto) => objeto[campo] && objeto[campo].includes(valor);
};

export const filtrarPorBairro = (lista, bairro) =>
    lista.filter(item => item.bairro.toLowerCase() === bairro.toLowerCase());
