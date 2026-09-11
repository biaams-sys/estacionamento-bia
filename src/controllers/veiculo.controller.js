const prisma = require("../data/prisma");

const cadastrar = async (req, res) => {
    const data = req.body;

    const item = await prisma.veiculo.create({
        data
    });

    res.json(item).status(201).end();
};

const listar = async (req, res) => {
    const lista = await prisma.veiculo.findMany();

    res.json(lista).status(200).end();
};

const buscar = async (req, res) => {
    const { placa } = req.params;
    
    const item = await prisma.veiculo.findUnique({
        where: { placa : placa }
    });

    res.json(item).status(200).end();
};

const atualizar = async (req, res) => {
    const { placa } = req.params;
    const dados = req.body;
    
    const item = await prisma.veiculo.update({
        where: { placa : placa },
        data: dados
    });

    res.status(200).json({
    mensagem: "Veículo atualizado com sucesso!",
    veiculo: item
});
};

const excluir = async (req, res) => {
    const { placa } = req.params;
    
    const item = await prisma.veiculo.delete({
        where: { placa : placa }
    });

    res.json(item).status(200).end();
};

module.exports = {
    cadastrar,
    listar,
    buscar,
    atualizar,
    excluir
}
