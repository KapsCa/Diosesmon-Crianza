/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiosesmonLogo } from './DiosesmonLogo';

describe('DiosesmonLogo', () => {
  it('carries the accessible name itself when the wordmark is not rendered', () => {
    render(<DiosesmonLogo />);

    const svg = screen.getByRole('img', { name: 'Diosesmon Crianza' });

    expect(svg).toBeInTheDocument();
    expect(svg).not.toHaveAttribute('aria-hidden');
  });

  it('stays out of the accessibility tree when the wordmark already names it', () => {
    render(<DiosesmonLogo showText />);

    // El texto visible ya da el nombre; el svg no debe repetirlo.
    expect(screen.getByText(/Crianza/)).toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'Diosesmon Crianza' })).not.toBeInTheDocument();

    const svg = document.querySelector('svg') as SVGSVGElement;
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('gives every rendered instance its own gradient id', () => {
    // Dos instancias en la misma página es el caso real (header + footer). Con
    // un id estático, el segundo `url(#...)` resuelve al primer gradiente.
    const { container } = render(
      <>
        <DiosesmonLogo />
        <DiosesmonLogo showText />
      </>
    );

    const gradients = Array.from(container.querySelectorAll('linearGradient'));
    expect(gradients).toHaveLength(2);

    const ids = gradients.map((g) => g.getAttribute('id'));
    expect(new Set(ids).size).toBe(2);
    expect(ids.every((id) => id && id.length > 0)).toBe(true);
  });

  it('references a gradient that actually exists in its own instance', () => {
    const { container } = render(
      <>
        <DiosesmonLogo />
        <DiosesmonLogo />
      </>
    );

    const declared = new Set(
      Array.from(container.querySelectorAll('linearGradient')).map((g) => g.getAttribute('id'))
    );

    const referenced = Array.from(container.querySelectorAll('[stroke^="url(#"]')).map((el) =>
      (el.getAttribute('stroke') || '').replace(/^url\(#/, '').replace(/\)$/, '')
    );

    expect(referenced).toHaveLength(2);
    for (const id of referenced) {
      expect(declared.has(id)).toBe(true);
    }
  });

  it('honours the size prop', () => {
    const { container } = render(<DiosesmonLogo size={64} />);

    const svg = container.querySelector('svg') as SVGSVGElement;
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('paints the mark from design tokens, not from raw hex literals', () => {
    const { container } = render(<DiosesmonLogo showText />);

    // Guardarraíl de la migración: los literales de marca (#A78BFA, #7C3AED,
    // #6D28D9) no deben volver a este archivo.
    expect(container.innerHTML).not.toMatch(/#[0-9a-fA-F]{6}/);
    expect(container.innerHTML).toContain('var(--color-brand');
  });
});
