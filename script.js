// Configuração - substitua pela URL do seu Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxIVmmw-WC_JygkDoSs6uc8Ugcs1awwBDJhMr8XsS9m1dT_qtw0x78RenN5h0zM01aI/exec';

// Preços dos itens
const PRICES = {
    feijoada: 18.00,
    feijaotropeiro: 12.00,
    macarronada: 18.00,
    salpicao: 18.00,
    quentinhas: 18.00
};

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('pedidoForm');
    form.addEventListener('submit', handleSubmit);
    
    // Atualiza o total quando qualquer quantidade muda
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', updateTotal);
    });
    
    updateTotal(); // Inicializa o total
});

function adjustQuantity(id, change) {
    const input = document.getElementById(id);
    let value = parseInt(input.value) + change;
    value = Math.max(0, value); // Não permite valores negativos
    input.value = value;
    updateTotal();
}

function updateTotal() {
    let total = 0;
    
    for (const item in PRICES) {
        const quantity = parseInt(document.getElementById(item).value) || 0;
        total += quantity * PRICES[item];
    }
    
    // Formata o valor com 2 casas decimais e vírgula como separador decimal
    document.getElementById('total').textContent = total.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const mensagem = document.getElementById('message');
    const nome = form.nome.value.trim();
    
    // Validação do nome
    if (nome === '') {
        showMessage('Por favor, insira seu nome', 'error');
        form.nome.focus();
        return;
    }
    
    // Verifica se pelo menos um item foi selecionado
    let totalItems = 0;
    for (const item in PRICES) {
        totalItems += parseInt(form[item].value) || 0;
    }
    
    if (totalItems === 0) {
        showMessage('Por favor, selecione pelo menos um item', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const data = {
        nome: nome,
        timestamp: new Date().toISOString()
    };
    
    // Coleta as quantidades
    for (const item in PRICES) {
        data[item] = parseInt(formData.get(item)) || 0;
    }
    
    // Calcula o total
    data.total = calculateTotal(data);
    
    try {
        showMessage('Enviando pedido...', 'success');
        
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('✅ Pedido enviado com sucesso!', 'success');
            form.reset();
            updateTotal();
            
            // Esconde o formulário temporariamente após envio
            form.style.display = 'none';
            setTimeout(() => {
                form.style.display = 'block';
            }, 3000);
        } else {
            showMessage(`❌ Erro: ${result.message}`, 'error');
        }
    } catch (error) {
        showMessage(`❌ Falha na conexão: ${error.message}`, 'error');
        console.error('Erro:', error);
    }
}

function calculateTotal(data) {
    return Object.keys(PRICES).reduce((total, item) => {
        return total + (PRICES[item] * (data[item] || 0));
    }, 0);
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    // Esconde a mensagem após 5 segundos (exceto para mensagens de sucesso)
    if (type !== 'success') {
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}