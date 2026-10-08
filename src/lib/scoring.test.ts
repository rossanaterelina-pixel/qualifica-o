import assert from 'node:assert/strict';
import { classify, score, type Answers } from './scoring';

const max: Answers = {
  uf: 'PI', cidade: 'Teresina', perfil: 'lanchonete', momento: 'comprar', volume: 'v100p',
  estrutura: 'tudo', inicio: 'semana', decide: 'sim', nome: 'A', whatsapp: '86999999999', negocio: 'B',
};
assert.equal(score(max).score, 24);
assert.equal(score(max).classe, 'QUENTE');
assert.equal(score(max).verificarEntrega, false);

const min: Answers = { ...max, uf: 'SP', cidade: 'Santos', perfil: 'comecar', momento: 'pesquisando',
  volume: 'v20', estrutura: 'orientacao', inicio: 'depois', decide: 'socio' };
assert.equal(score(min).score, 5);
assert.equal(score(min).classe, 'FRIO');
assert.equal(score(min).verificarEntrega, true);

assert.equal(score({ ...max, cidade: ' teresina ' }).score, 24); // normaliza
assert.equal(score({ ...max, perfil: 'supermercado' }).proximaAcao.startsWith('Apresentar a mentoria'), true);
assert.deepEqual([9, 10, 16, 17].map(classify), ['FRIO', 'MORNO', 'MORNO', 'QUENTE']);
console.log('scoring ok');
