type PipelineErrors = 'EXTRACT_ERROR' | 'MAP_ERROR' | 'LOAD_ERROR';

export class PipelineError extends Error {
  constructor(name: PipelineErrors, message?: string) {
    super(message);
    this.name = name;
  }
}
