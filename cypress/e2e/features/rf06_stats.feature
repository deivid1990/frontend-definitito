Feature: RF-06 Visualización de estadísticas de constancia
  Como usuario analítico
  Quiero ver mis estadísticas de constancia
  Para analizar mi disciplina y cumplimiento de objetivos

  Background:
    Given el usuario inicia sesión correctamente

  Scenario: Visualizar dashboard de estadísticas (últimos 7 días)
    When el usuario navega a la sección de estadísticas
    Then el sistema debe mostrar el dashboard de estadísticas
    And debe mostrar el gráfico de constancia de los últimos 7 días
    And debe mostrar el conteo de sesiones semanales
    And debe mostrar indicadores por colores de cumplimiento
    And el dashboard debe ser responsive
