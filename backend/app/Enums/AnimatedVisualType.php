<?php

namespace App\Enums;

enum AnimatedVisualType: string
{
    case FlowingLines = 'flowing-lines';
    case Consolidation = 'consolidation';
    case Workflow = 'workflow';
    case Network = 'network';
    case Insight = 'insight';
}
