type PipelineErrors = 'EXTRACT_ERROR' | 'TRANSFORM_ERROR' | 'LOAD_ERROR';

export class PipelineError extends Error {
  constructor(name: PipelineErrors, message?: string) {
    super(message);
    this.name = name;
  }
}
