/**
 * Tests para verificar el funcionamiento del sanitizador de links
 * Ejecutar: node src/test-sanitizer.js
 */
import { sanitizeLinks, cleanEmojis, processText } from './services/linkSanitizer.js';

console.log('🧪 Probando sanitizador de enlaces y emojis\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const testCases = [
    {
        input: 'revisa https://www.google.com/search?q=test ahora',
        expected: 'revisa google.com ahora',
        description: 'URL completa con parámetros'
    },
    {
        input: 'www.youtube.com/watch?v=123',
        expected: 'youtube.com',
        description: 'URL con www'
    },
    {
        input: 'discord.gg/test',
        expected: 'discord.gg',
        description: 'URL corta sin protocolo'
    },
    {
        input: 'https://sub.domain.com/path',
        expected: 'domain.com',
        description: 'URL con subdominio'
    },
    {
        input: 'Mira este link: https://www.github.com/usuario/repo y este otro www.example.com/page',
        expected: 'Mira este link: github.com y este otro example.com',
        description: 'Múltiples URLs'
    },
    {
        input: 'Sin enlaces aquí',
        expected: 'Sin enlaces aquí',
        description: 'Texto sin URLs'
    },
    {
        input: 'http://test.co.uk/page',
        expected: 'test.co.uk',
        description: 'URL con TLD de dos niveles'
    },
    {
        input: '<:NazunaStare:1308498933286178826>',
        expected: 'NazunaStare',
        description: 'Emoji personalizado estático'
    },
    {
        input: '<a:spin:123456789>',
        expected: 'spin',
        description: 'Emoji personalizado animado'
    },
    {
        input: 'Hola <:wave:123> como estas <:smile:456>',
        expected: 'Hola wave como estas smile',
        description: 'Múltiples emojis en texto'
    },
    {
        input: 'Mira <:emoji:123> en https://discord.gg/test',
        expected: 'Mira emoji en discord.gg',
        description: 'Emoji y URL combinados'
    }
];

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
    const result = processText(testCase.input);
    const success = result === testCase.expected;
    
    if (success) {
        passed++;
        console.log(`✅ Test ${index + 1}: ${testCase.description}`);
    } else {
        failed++;
        console.log(`❌ Test ${index + 1}: ${testCase.description}`);
        console.log(`   Entrada:   "${testCase.input}"`);
        console.log(`   Esperado:  "${testCase.expected}"`);
        console.log(`   Obtenido:  "${result}"`);
    }
    console.log();
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`\n📊 Resultados: ${passed}/${testCases.length} tests pasaron`);

if (failed === 0) {
    console.log('🎉 ¡Todos los tests pasaron correctamente!\n');
} else {
    console.log(`⚠️  ${failed} test(s) fallaron\n`);
    process.exit(1);
}
