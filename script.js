// Configuração - substitua pela URL do seu Apps Script
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpz7BKPA8r-goWuEW79cArOzDZWuCUWVCjjUd_s7RwIXNAxDANe2i30EBtNvYEuyef5w/exec';

// Preços dos itens (deve corresponder ao cálculo no Apps Script)
const PRICES = {
    feijoada: 25,
    feijaotropeiro: 20,
    macarronada: 18,
    salpicao: 15,
    quentinhas: 12
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
    
    document.getElementById('total').textContent = total.toFixed(2);
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const data = {
        nome: formData.get('nome')
    };
    
    // Coleta as quantidades
    for (const item in PRICES) {
        data[item] = parseInt(formData.get(item)) || 0;
    }
    
    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.success) {
            showMessage('Pedido enviado com sucesso!', 'success');
            form.reset();
            updateTotal();
        } else {
            showMessage(`Erro: ${result.message}`, 'error');
        }
    } catch (error) {
        showMessage(`Falha na conexão: ${error.message}`, 'error');
    }
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}