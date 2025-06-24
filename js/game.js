document.addEventListener('DOMContentLoaded', () => {

    const dicaElement = document.getElementById('dica');
    const wordElement = document.getElementById('palavra');
    const keyboardElement = document.getElementById('teclado');
    const messageElement = document.getElementById('message');
    const letraInput = document.getElementById('letra');
    const flowerElement = document.getElementById('flor');
    
    let palavraSecreta = '';
    let dica = '';
    let letrasAcertadas = [];
    let letrasErradas = [];
    let erros = 0;
    const maxErros =6;

    function iniciarJogo() {
        const modo = localStorage.getItem('modo') || 'solo'; 

        if (modo === 'duo') {
            const palavra = localStorage.getItem('palavraPersonalizada');
            const dicaCustom = localStorage.getItem('dicaPersonalizada');

            if (palavra && dicaCustom) {
                palavraSecreta = palavra.toUpperCase();
                dica = dicaCustom;
            } else {
                alert('Palavra não definida! Retornando ao início.');
                window.location.href = 'index.html';
                return;
            }
        } else {
            
            if (typeof palavras === 'undefined') {
                palavras = [{ palavra: "FLOR", dica: "Parte de uma planta" }];
            }
            const randomIndex = Math.floor(Math.random() * palavras.length);
            palavraSecreta = palavras[randomIndex].palavra.toUpperCase();
            dica = palavras[randomIndex].dica;
        }
        
        letrasAcertadas = Array(palavraSecreta.length).fill('_');
        for(let i = 0; i < palavraSecreta.length; i++) {
            if (palavraSecreta[i] === ' ') {
                letrasAcertadas[i] = ' ';
            }
        }

        letrasErradas = [];
        erros = 0;
        
        dicaElement.textContent = dica;
        wordElement.textContent = letrasAcertadas.join('');
        showMessage('');
        letraInput.value = '';
        letraInput.disabled = false;
        letraInput.focus();
        
        criarTeclado();
        criarFlor();
    }

    function criarFlor() {
        flowerElement.querySelectorAll('.petala').forEach(petal => petal.remove());
      
        for (let i = 0; i < maxErros; i++) {
            const petal = document.createElement('div');
            petal.className = 'petala';
            petal.style.transform = `rotate(${i * 60}deg) translateY(10px)`; 
            flowerElement.appendChild(petal);
        }
    }

    function cairPetala() {
        const petals = document.querySelectorAll('.petala:not(.queda)');
        if (petals.length > 0) {
            petals[petals.length - 1].classList.add('queda');
        }
    }

    function criarTeclado() {
        keyboardElement.innerHTML = '';
        const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (const letra of alfabeto) {
            const button = document.createElement('button');
            button.className = 'letter-btn';
            button.textContent = letra;
            button.onclick = () => tentarLetra(letra);
            keyboardElement.appendChild(button);
        }
    }

    function tentarLetra(letra) {
        letra = letra.toUpperCase();
        
        if (letrasAcertadas.includes(letra) || letrasErradas.includes(letra)) {
            showMessage(`A letra ${letra} já foi tentada!`, 'orange');
            return;
        }
      
        if (palavraSecreta.includes(letra)) {
            for (let i = 0; i < palavraSecreta.length; i++) {
                if (palavraSecreta[i] === letra) {
                    letrasAcertadas[i] = letra;
                }
            }
            marcarLetraNoTeclado(letra, 'correct');
            showMessage(`Ótimo! A letra ${letra} existe!`, 'green');
        } else {
            letrasErradas.push(letra);
            erros++;
            cairPetala();
            marcarLetraNoTeclado(letra, 'wrong');
            showMessage(`Que pena! A letra ${letra} não existe.`, 'red');
        }
      
        atualizarJogo();
    }
    
    function atualizarJogo() {
        wordElement.textContent = letrasAcertadas.join('');
        
        if (!letrasAcertadas.includes('_')) {
            showMessage('Parabéns, você venceu!', 'green');
            finalizarJogo();
        } else if (erros >= maxErros) {
            showMessage(`Fim de jogo! A palavra era: ${palavraSecreta}`, 'red');
            wordElement.textContent = palavraSecreta.split('').join('');
            finalizarJogo();
        }

        letraInput.value = '';
        letraInput.focus();
    }

    function finalizarJogo() {
        letraInput.disabled = true;
        document.querySelectorAll('.letter-btn').forEach(btn => {
            btn.disabled = true;
            btn.classList.add('used');
        });
    }

    function showMessage(msg, type = '') {
      messageElement.textContent = msg;
      messageElement.style.color =
          type === 'green' ? 'var(--correct-color)' :
          type === 'red' ? 'var(--wrong-color)' :
          type === 'orange' ? 'orange' :
          'var(--text-color)';
          
      messageElement.style.opacity = '1';
      messageElement.style.transform = 'translateY(0)';
    }

    function marcarLetraNoTeclado(letra, status) {
        document.querySelectorAll('.letter-btn').forEach(btn => {
            if (btn.textContent === letra) {
                btn.classList.add(status); 
                btn.classList.add('used');
                btn.disabled = true;
            }
        });
    }

    window.enviarLetra = function() {
        const letra = letraInput.value.toUpperCase();
        if (letra && /^[A-Z]$/.test(letra)) {
            tentarLetra(letra);
        } else {
            showMessage('Por favor, digite uma única letra.', 'orange');
        }
        letraInput.value = '';
    }

    window.novoJogo = function() {
        localStorage.removeItem('palavraPersonalizada');
        localStorage.removeItem('dicaPersonalizada');
        window.location.href = 'index.html';
    }

    letraInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            enviarLetra();
        }
    });

    iniciarJogo();
});