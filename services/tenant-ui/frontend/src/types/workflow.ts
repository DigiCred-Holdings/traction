export interface Workflow {
  workflow_id: string;
  name: string;
  initial_state: string;
  render: any;
  states: State[];
}

export interface State {
  name: string;
  state_id: string;
  actions: Action[];
  transitions: Transition[];
  display_data: DisplayData[];
}

export interface Action {
  type: string;
  value: any;
  action_id: string;
  condition: string;
}

export interface Transition {
  type: string;
  state_id: string;
  condition: string;
  workflow_id: string;
  transition_id: string;
}

export type DisplayData =
  | {
      type: 'image';
      url: string;
    }
  | {
      type: 'text';
      text: string;
      display?: 'title';
      condition?: string;
    }
  | {
      type: 'extended';
      text: string;
    }
  | {
      type: 'button';
      label: string;
      actionID: string;
    };
