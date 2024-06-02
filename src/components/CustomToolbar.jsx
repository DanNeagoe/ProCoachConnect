import React from 'react';
import './CustomToolbar.scss'

class CustomToolbar extends React.Component {
  constructor(props) {
    super(props);
    this.navigate = this.navigate.bind(this);
  }
  navigate = (action) => {
    this.props.onNavigate(action);
  }

  render() {
    return (
      <div className='rbc-toolbar'>

        <span className="rbc-btn-group">
          <button type="button" onClick={() => this.navigate('PREV')}>înapoi</button>
          <button type="button" onClick={() => this.navigate('NEXT')}>înainte</button>
          <button className="today" type="button" onClick={() => this.navigate('TODAY')} >azi</button>
          <button className="week" type="button" onClick={() => this.props.onView('week')}>săpt.</button>
          <button className="agenda" type="button" onClick={this.props.onView.bind(null, 'agenda')}>agendă</button>
        </span>
      </div>
    );
  }
}

export default CustomToolbar;