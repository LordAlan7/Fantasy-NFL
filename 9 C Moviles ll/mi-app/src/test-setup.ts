/**
 * Arranque del entorno de pruebas.
 *
 * angular.json ya apuntaba a este archivo en `setupFiles`, pero nunca llegó a
 * crearse, así que `ng test` fallaba antes de ejecutar un solo test.
 *
 * No inicializa el TestBed a mano: el builder @angular/build:unit-test ya lo
 * hace, y llamar a initTestEnvironment aquí provoca un error de doble
 * inicialización. Este archivo existe para configuración global de los tests
 * (mocks, matchers, etc.); de momento no hace falta ninguna.
 */
export {};
