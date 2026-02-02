Feature: RF-04 Registro de perfil físico
  Como usuario autenticado
  Quiero registrar mi perfil físico
  Para personalizar el seguimiento y recomendaciones del sistema

  Background:
    Given el usuario inicia sesión con credenciales válidas

  @rf04 @e2e
  Scenario: Registrar perfil físico correctamente
    When navega a perfil físico desde el menú lateral
    And completa los datos del perfil físico
    And guarda el perfil físico
    Then el sistema muestra confirmación visual de guardado exitoso
