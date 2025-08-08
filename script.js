document.addEventListener('DOMContentLoaded', function() {

    // Animação dos depoimentos ao rolar a página
    const chatBubbles = document.querySelectorAll('.chat-bubble');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Adiciona um pequeno delay para cada mensagem
                setTimeout(() => {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200); // 200ms de atraso entre cada bolha
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    chatBubbles.forEach(bubble => {
        observer.observe(bubble);
    });

    // Rolagem suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

});