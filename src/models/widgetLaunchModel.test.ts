import assert from 'node:assert/strict';
import { test } from 'node:test';
import { isChatbotLaunchMode, widgetLaunchModel } from './widgetLaunchModel';

test('links do widget reconhecem apenas modos válidos', () => {
  assert.equal(widgetLaunchModel.routeFor('finup://chatbot?modo=voz'), '/chatbot?modo=voz');
  assert.equal(widgetLaunchModel.routeFor('/chatbot?origem=widget&modo=texto'), '/chatbot?modo=texto');
  assert.equal(widgetLaunchModel.routeFor('/chatbot?modo=invalido'), null);
  assert.equal(isChatbotLaunchMode(null), false);
});

test('rota pendente é consumida uma vez ou descartada', () => {
  widgetLaunchModel.setPending('/chatbot?modo=texto');
  assert.equal(widgetLaunchModel.consumePending(), '/chatbot?modo=texto');
  assert.equal(widgetLaunchModel.consumePending(), null);
  widgetLaunchModel.setPending('/chatbot?modo=voz');
  widgetLaunchModel.discardPending();
  assert.equal(widgetLaunchModel.consumePending(), null);
});
