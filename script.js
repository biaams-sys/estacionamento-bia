const API_URL = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    carregarEstadias();
    configurarEventos();
});

function configurarEventos() {
    document.getElementById("btnNovaEstadia").addEventListener("click", () => {
        document.getElementById("formNovaEstadia").reset();
        abrirModal("modalNovaEstadia");
    });

    document.getElementById("btnAbrirVeiculos").addEventListener("click", () => {
        abrirModal("modalVeiculos");
        carregarVeiculos();
    });

    document.getElementById("btnNovoVeiculo").addEventListener("click", () => {
        abrirModalFormVeiculo(false);
    });
}

function abrirModal(idModal) {
    document.getElementById(idModal).classList.remove("hidden");
}

function fecharModal(idModal) {
    document.getElementById(idModal).classList.add("hidden");
}

function mostrarMensagem(mensagem) {
    const toast = document.getElementById("toast");
    toast.textContent = mensagem;
    toast.classList.remove("hidden");
    
    setTimeout(() => {
        toast.classList.add("hidden");
    }, 3500);
}

function formatarMoeda(valor) {
    if (valor === null || valor === undefined || valor === "") return "-";
    return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarDataHora(dataIso) {
    if (!dataIso) return "-";
    const data = new Date(dataIso);
    if (isNaN(data.getTime())) return "-";
    return data.toLocaleString("pt-BR");
}

function converterDataParaInput(dataIso) {
    if (!dataIso) return "";
    const data = new Date(dataIso);
    if (isNaN(data.getTime())) return "";
    
    const pad = (n) => String(n).padStart(2, '0');
    const ano = data.getFullYear();
    const mes = pad(data.getMonth() + 1);
    const dia = pad(data.getDate());
    const horas = pad(data.getHours());
    const minutos = pad(data.getMinutes());
    
    return `${ano}-${mes}-${dia}T${horas}:${minutos}`;
}


async function carregarEstadias() {
    const tbody = document.getElementById("tabelaEstadiasCorpo");
    try {
        const resposta = await fetch(`${API_URL}/estadia/listar`);
        if (!resposta.ok) throw new Error();
        const estadias = await resposta.json();

        tbody.innerHTML = "";

        if (estadias.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center">Nenhuma estadia registrada.</td></tr>`;
            return;
        }

        estadias.forEach((estadia) => {
            const tr = document.createElement("tr");

            const status = estadia.saida 
                ? `<span class="status-badge status-encerrado">Encerrado</span>`
                : `<span class="status-badge status-estacionado">Estacionado</span>`;

            tr.innerHTML = `
                <td>${estadia.id}</td>
                <td><strong>${estadia.placa}</strong></td>
                <td>${formatarDataHora(estadia.entrada)}</td>
                <td>${formatarDataHora(estadia.saida)}</td>
                <td>${formatarMoeda(estadia.valorHora)}</td>
                <td>${formatarMoeda(estadia.valorTotal)}</td>
                <td>${status}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="prepararEdicaoEstadia(${estadia.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirEstadia(${estadia.id})">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center">Erro ao carregar estadias da API.</td></tr>`;
    }
}

async function salvarNovaEstadia(evento) {
    evento.preventDefault();
    
    const placa = document.getElementById("estadiaPlaca").value.trim();
    const valorHora = parseFloat(document.getElementById("estadiaValorHora").value);

    const dados = { placa, valorHora };

    try {
        const resposta = await fetch(`${API_URL}/estadia/cadastrar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error();

        fecharModal("modalNovaEstadia");
        mostrarMensagem("Entrada registrada com sucesso!");
        carregarEstadias();
    } catch (erro) {
        alert("Erro ao registrar entrada da estadia.");
    }
}

async function prepararEdicaoEstadia(id) {
    try {
        const resposta = await fetch(`${API_URL}/estadia/buscar/${id}`);
        if (!resposta.ok) throw new Error();
        const estadia = await resposta.json();

        document.getElementById("editEstadiaId").value = estadia.id;
        document.getElementById("editEstadiaPlaca").value = estadia.placa;
        document.getElementById("editEstadiaEntrada").value = converterDataParaInput(estadia.entrada);
        document.getElementById("editEstadiaSaida").value = converterDataParaInput(estadia.saida);
        document.getElementById("editEstadiaValorHora").value = estadia.valorHora || "";
        document.getElementById("editEstadiaValorTotal").value = estadia.valorTotal || "";

        abrirModal("modalEditarEstadia");
    } catch (erro) {
        alert("Erro ao buscar dados da estadia.");
    }
}

async function salvarEdicaoEstadia(evento) {
    evento.preventDefault();

    const id = document.getElementById("editEstadiaId").value;
    const placa = document.getElementById("editEstadiaPlaca").value.trim();
    const entradaInput = document.getElementById("editEstadiaEntrada").value;
    const saidaInput = document.getElementById("editEstadiaSaida").value;
    const valorHoraInput = document.getElementById("editEstadiaValorHora").value;
    const valorTotalInput = document.getElementById("editEstadiaValorTotal").value;

    const dados = {
        placa: placa,
        entrada: entradaInput ? new Date(entradaInput).toISOString() : null,
        saida: saidaInput ? new Date(saidaInput).toISOString() : null,
        valorHora: valorHoraInput !== "" ? parseFloat(valorHoraInput) : null,
        valorTotal: valorTotalInput !== "" ? parseFloat(valorTotalInput) : null
    };

    try {
        const resposta = await fetch(`${API_URL}/estadia/atualizar/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error();

        fecharModal("modalEditarEstadia");
        mostrarMensagem("Estadia atualizada com sucesso!");
        carregarEstadias();
    } catch (erro) {
        alert("Erro ao atualizar estadia.");
    }
}

async function excluirEstadia(id) {
    if (!confirm("Deseja realmente excluir esta estadia?")) return;

    try {
        const resposta = await fetch(`${API_URL}/estadia/excluir/${id}`, {
            method: "DELETE"
        });

        if (!resposta.ok) throw new Error();

        mostrarMensagem("Estadia excluída com sucesso!");
        carregarEstadias();
    } catch (erro) {
        alert("Erro ao excluir estadia.");
    }
}

async function carregarVeiculos() {
    const tbody = document.getElementById("tabelaVeiculosCorpo");
    try {
        const resposta = await fetch(`${API_URL}/veiculo/listar`);
        if (!resposta.ok) throw new Error();
        const veiculos = await resposta.json();

        tbody.innerHTML = "";

        if (veiculos.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">Nenhum veículo cadastrado.</td></tr>`;
            return;
        }

        veiculos.forEach((veiculo) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${veiculo.placa}</strong></td>
                <td>${veiculo.marca} ${veiculo.modelo}</td>
                <td>${veiculo.proprietario}</td>
                <td>${veiculo.tipo}</td>
                <td>
                    <button class="btn btn-primary btn-sm" onclick="prepararEdicaoVeiculo('${veiculo.placa}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="excluirVeiculo('${veiculo.placa}')">Excluir</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (erro) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center">Erro ao carregar veículos da API.</td></tr>`;
    }
}

function abrirModalFormVeiculo(modoEdicao) {
    const form = document.getElementById("formVeiculo");
    form.reset();

    const campoPlaca = document.getElementById("veiculoPlaca");
    const modoField = document.getElementById("veiculoModoEdicao");
    const titulo = document.getElementById("tituloModalVeiculo");

    if (modoEdicao) {
        modoField.value = "true";
        campoPlaca.disabled = true; 
        titulo.textContent = "Editar Veículo";
    } else {
        modoField.value = "false";
        campoPlaca.disabled = false;
        titulo.textContent = "Cadastrar Veículo";
    }

    abrirModal("modalFormVeiculo");
}

async function salvarVeiculo(evento) {
    evento.preventDefault();

    const modoEdicao = document.getElementById("veiculoModoEdicao").value === "true";
    const placa = document.getElementById("veiculoPlaca").value.trim();

    const dados = {
        placa: placa,
        tipo: document.getElementById("veiculoTipo").value,
        proprietario: document.getElementById("veiculoProprietario").value.trim(),
        marca: document.getElementById("veiculoMarca").value.trim(),
        modelo: document.getElementById("veiculoModelo").value.trim(),
        cor: document.getElementById("veiculoCor").value.trim(),
        ano: parseInt(document.getElementById("veiculoAno").value, 10),
        telefone: document.getElementById("veiculoTelefone").value.trim()
    };

    let url = `${API_URL}/veiculo/cadastrar`;
    let metodo = "POST";

    if (modoEdicao) {
        url = `${API_URL}/veiculo/atualizar/${placa}`;
        metodo = "PUT";
    }

    try {
        const resposta = await fetch(url, {
            method: metodo,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) throw new Error();

        fecharModal("modalFormVeiculo");
        
        if (modoEdicao) {
            mostrarMensagem("Veículo atualizado com sucesso!");
        } else {
            mostrarMensagem("Veículo cadastrado com sucesso!");
        }

        carregarVeiculos();
    } catch (erro) {
        alert("Erro ao salvar dados do veículo.");
    }
}

async function prepararEdicaoVeiculo(placa) {
    try {
        const resposta = await fetch(`${API_URL}/veiculo/buscar/${placa}`);
        if (!resposta.ok) throw new Error();
        const veiculo = await resposta.json();

        document.getElementById("veiculoPlaca").value = veiculo.placa;
        document.getElementById("veiculoTipo").value = veiculo.tipo;
        document.getElementById("veiculoProprietario").value = veiculo.proprietario;
        document.getElementById("veiculoMarca").value = veiculo.marca;
        document.getElementById("veiculoModelo").value = veiculo.modelo;
        document.getElementById("veiculoCor").value = veiculo.cor;
        document.getElementById("veiculoAno").value = veiculo.ano;
        document.getElementById("veiculoTelefone").value = veiculo.telefone;

        abrirModalFormVeiculo(true);
    } catch (erro) {
        alert("Erro ao buscar informações do veículo.");
    }
}

async function excluirVeiculo(placa) {
    if (!confirm(`Deseja excluir o veículo ${placa}?`)) return;

    try {
        const resposta = await fetch(`${API_URL}/veiculo/excluir/${placa}`, {
            method: "DELETE"
        });

        if (!resposta.ok) throw new Error();

        mostrarMensagem("Veículo excluído com sucesso!");
        carregarVeiculos();
    } catch (erro) {
        alert("Erro ao excluir veículo.");
    }
}