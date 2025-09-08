const API_KEY = process.env.OPENWEATHER_API_KEY

export const buscarClima = async (req, res) => {
  try {
    const { cidade } = req.query;

    if (!cidade) {
      return res.status(400).json({ erro: "Informe o nome da cidade" });
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${cidade}&appid=${API_KEY}&lang=pt_br&units=metric`;

    const resposta = await fetch(url);

    if (!resposta.ok) {
      return res.status(404).json({ erro: "Cidade não encontrada" });
    }

    const dados = await resposta.json();

    res.json({
      cidade: dados.name,
      temperatura: dados.main.temp,
      descricao: dados.weather[0].description,
      umidade: dados.main.humidity,
      vento: dados.wind.speed
    });
  } catch (erro) {
    console.error("Erro ao buscar clima:", erro);
    res.status(500).json({ erro: "Erro ao buscar clima" });
  }
};
