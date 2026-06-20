// 预测模块的工厂入口 - 根据 .env 切换 provider
import { ManualClaudeCodeProvider } from './manual-provider';
import type { PredictionProvider } from './provider';

let _provider: PredictionProvider | null = null;

export function getPredictionProvider(): PredictionProvider {
  if (_provider) return _provider;
  const kind = process.env.PREDICTION_PROVIDER ?? 'manual';
  switch (kind) {
    // case 'deepseek':
    //   _provider = new DeepSeekProvider();
    //   break;
    // case 'anthropic':
    //   _provider = new AnthropicProvider();
    //   break;
    case 'manual':
    default:
      _provider = new ManualClaudeCodeProvider();
  }
  return _provider;
}

export type { PredictionProvider, MatchPredictionInput } from './provider';
