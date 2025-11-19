// Sistema de Notificações
window.showNotification = function(message, type = 'info', duration = 3000) {
    // Remover notificações existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => {
        if (notif.classList.contains('hiding')) {
            notif.remove();
        }
    });

    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Ícone baseado no tipo
    const icons = {
        success: '✓',
        error: '✕',
        info: 'ℹ',
        warning: '⚠'
    };

    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Adicionar ao body
    document.body.appendChild(notification);

    // Remover automaticamente após a duração
    if (duration > 0) {
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    }

    return notification;
};

// Funções de conveniência
window.showSuccess = function(message, duration = 3000) {
    return window.showNotification(message, 'success', duration);
};

window.showError = function(message, duration = 5000) {
    return window.showNotification(message, 'error', duration);
};

window.showInfo = function(message, duration = 3000) {
    return window.showNotification(message, 'info', duration);
};

window.showWarning = function(message, duration = 4000) {
    return window.showNotification(message, 'warning', duration);
};

