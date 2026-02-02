Feature: RF-05 Seguimiento y visualización del progreso
  Como usuario del sistema
  Quiero registrar y visualizar mi progreso físico mediante fotografías
  Para comparar mis cambios físicos a lo largo del tiempo

  Background:
    Given el usuario inicia sesión correctamente

  Scenario: Registro y visualización del progreso mediante fotografías
    When el usuario navega a la sección de seguimiento de progreso
    Then el sistema debe mostrar la pantalla de progreso
    When el usuario sube una fotografía de progreso con descripción
    Then el sistema debe guardar la fotografía en el backend
    And la fotografía debe aparecer en la galería de progreso
