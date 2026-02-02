Feature: RF-01 Interacción con Coach Virtual IA

Scenario: Enviar mensaje y recibir respuesta del Coach
  Given el usuario inicia sesión
  And entra a la página AI Coach
  When escribe el mensaje "Necesito una rutina de fuerza"
  And presiona enviar
  Then debe ver una respuesta del Coach

