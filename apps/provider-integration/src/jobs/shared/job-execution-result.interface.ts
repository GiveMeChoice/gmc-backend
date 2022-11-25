export interface JobExecutionResult {
  runAt: Date;
  runTime: number;
  status: 'SUCCESS' | 'ERROR';
  message: string;
}
