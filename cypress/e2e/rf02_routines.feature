Feature: RF-02 Gestión de rutinas de entrenamiento
  Como usuario de GymAI Coach
  Quiero diseñar y activar una rutina
  Para gestionar mis entrenamientos

  Scenario: Visualizar la sección de rutinas
    Given el usuario inicia sesión
    And entra a la página AI Coach
    When cambia al modo Diseñar
    And inicia el diseño de rutina
    Then debe ver el preview de la rutina generada
    When acepta la rutina generada
    Then debe ver confirmación de rutina activada
