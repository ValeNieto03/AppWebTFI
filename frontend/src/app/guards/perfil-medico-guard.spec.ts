import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { perfilMedicoGuard } from './perfil-medico-guard';

describe('perfilMedicoGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => perfilMedicoGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
