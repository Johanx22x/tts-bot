/**
 * Utilidades de logging
 */

const COLORS = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

export function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('es-ES');
    
    switch(type) {
        case 'error':
            console.error(`${COLORS.red}[${timestamp}] ❌ ${message}${COLORS.reset}`);
            break;
        case 'success':
            console.log(`${COLORS.green}[${timestamp}] ✅ ${message}${COLORS.reset}`);
            break;
        case 'warning':
            console.warn(`${COLORS.yellow}[${timestamp}] ⚠️  ${message}${COLORS.reset}`);
            break;
        case 'info':
        default:
            console.log(`${COLORS.cyan}[${timestamp}] ℹ️  ${message}${COLORS.reset}`);
            break;
    }
}

export default { log };
