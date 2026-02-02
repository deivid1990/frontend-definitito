Feature: RF-03 Consulta de biblioteca de ejercicios
  Como usuario de GymAI Coach
  Quiero consultar la biblioteca de ejercicios
  Para conocer los ejercicios disponibles en la plataforma

  Scenario: Visualizar biblioteca de ejercicios
    Given el usuario inicia sesión
    And entra a la biblioteca de ejercicios
    Then debe visualizar una lista de ejercicios disponibles
