//FLL Robot Game Challenge score Calculator
import React, {Component} from 'react';
import {BrowserRouter, Route, Link, NavLink, Switch } from 'react-router-dom';
import Ad from './GoogleAd';
import About from './about';
import ReactGA from 'react-ga';

//Load the game challenges from a JSON file
import challenges from './FLL2017Challenge.json';
//import challenges from './FLL2013Challenge.json';

function CurrentScore(props){
const aScore = "Score: "+props.curScore+" pts";
  return <text className="navbar-text" style={{textAlignVertical: "center", textAlign: "center", padding:'3px', margin:'3px',  marginTop:'10px', border:'3px'}}>{aScore}</text>
}

//Navigation bar
function NavBar(props){
  const  Title = 'Hydr00-Dynamics';
  return(
    <nav className="navbar navbar-inverse navbar-fixed-top">
      <div className="container-fluid">
        <div className="navbar-header">
          <a className="navbar-brand" href={`${process.env.PUBLIC_URL}/`}>{Title}</a>
          <CurrentScore curScore={props.curScore} />
          <button className="btn navbar-btn" style={{width: '45px', padding:'3px', margin:'0px',  marginTop:'10px', border:'1px'}}>Reset</button>&nbsp;&nbsp;
          <a className="navbar-nav navbar-right" href={`${process.env.PUBLIC_URL}/about`} style={{padding:'7px', margin:'7px',  marginTop:'7px', border:'7px'}}>About</a>
        </div>
      </div>
    </nav>
  )
}

//Page header
function PageHeader(props){
  const {Title, Description, aLink} = props;
  return(
    <div className="jumbotron">
      <h1>{Title}</h1>
      <p>{Description}  <Link to={aLink} target="_blank">More Info</Link></p>
    </div>
  )
}

function ACheckbox(props){
  const {name, id, handleChange} = props;
  return(
    <input type="checkbox"
          name={name}
          id={id}
          key={id.toString()}
          style={{width: '20px', height: '20px'}}
          onChange={handleChange}/>
  )
}

function AComboBox(props){
  const {score, name, id, handleChange} = props;
  return(
    <select name={name} id={id} onChange={handleChange}>
      {score.map((aScore, index) =>
        <option
          value={aScore.value}
          key={id +"-"+ aScore.name}
          style={{height: '20px'}}
        >{aScore.name}</option>
      )}
    </select>
  )
}

function ARadioGroup(props){
  const {score, name, id, handleChange} = props;
  return(
    <div className="radio" name={id} key={id} id={id}>
    {score.map((aScore) =>
      <label
          key={"L"+id +"-"+ aScore.value.toString()}
          >
          <input type="radio"
              name={name}
              key={id +"-"+ aScore.value.toString()}
              value={aScore.value}
              style={{height: '20px'}}
              onChange={handleChange}
          ></input>
          {aScore.name}
      </label>
    )}
    </div>
  )
}

function Description(props){
  //Show full or partial description of the challenge
  const {challenge, expanded} = props;
  return(
    <div>
      <button className="btn btn-primary"
              value={ expanded ? false : true }
              id={challenge.name}
              style={{ width: '60px', height: '20px',
                 margin:'3px', border:'0', padding:'0',
                 float:'right'}}
              onClick={props.onClick} >
      {expanded ? (
        "<< Less"
        ) : (
        "More >>"
        )
      }
      </button>
      <p>Mission: {challenge.hint}</p>
      { expanded  ?  challenge.description: null}
      <p/>
    </div>
  )
}

//Display a single challenge item
function ChallengeItem(props) {
  const {challenge, expandedItems, handleChange, handleClick} = props;
  const expanded = (expandedItems.indexOf(challenge.name) > -1);

  const panelColor = 'white';
  const headColor = 'white'; //#F0F8FF
  const maxColor = 'white';
  const ctrlColor = 'white';
  const descColor ='white';

  return(
    <div className="col-xs-6 col-lg-4"
      style={{ backgroundColor: panelColor, borderTop: '1px solid', borderBottomColor: 'LightGrey', padding: '7px'}}>
      <img className="image" src={"icons/2017/" + challenge.picture} alt={challenge.name}
        style={{ float:'left', top: '0', left: '0', width: '70px', height: '70px' }} />
      <h5 style={{ textAlign: 'right', backgroundColor: headColor}}>{challenge.name}</h5>
      <h5 style={{ backgroundColor: maxColor}}>Max {challenge.max} pts
        <div style={{ backgroundColor: ctrlColor, float:'right'}}>
          {(() => {
            switch (challenge.controlType) {
              case "checkbox":  return <ACheckbox score={challenge.score}
                                                  name={challenge.name}
                                                  id={challenge.guid}
                                                  handleChange = {handleChange} />;
              case "radio":     return <ARadioGroup score={challenge.score}
                                                  name={challenge.name}
                                                  id={challenge.guid}
                                                  handleChange ={handleChange} />;
              case "combo":     return <AComboBox score={challenge.score}
                                                  name={challenge.name}
                                                  id={challenge.guid}
                                                  handleChange ={handleChange} />;
              default:  return '';
            }
          })()}
        </div>
      </h5><br/>
      <Description
        challenge={challenge}
        expanded={expanded}
        style={{ backgroundColor: descColor}}
        onClick={handleClick}/>
    </div>
  )
}

//create the list of challenges
function ChallengeList(props) {
  const {challenges, expandedItems, handleChange, handleClick} = props;
  return (
    <div className ="row">
      {challenges.map((challenge) =>
        <ChallengeItem key={challenge.guid.toString()}
                  challenge={challenge}
                  expandedItems={expandedItems}
                  handleChange={handleChange}
                  handleClick={handleClick}
                    />
      )}
    </div>
  );
}

class FLLChallengeCalc extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stateChallenges : challenges,
      curScore: 0,
      prevScores: [],
      expandedItems: []
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleClick = this.handleClick.bind(this);

    // Add tracking ID created from https://analytics.google.com/analytics/web/#home/
    ReactGA.initialize('UA-2578834-13');
    // This just needs to be called once since we have no routes in this case.
    ReactGA.pageview(window.location.pathname);
  }

  componentDidMount(){
    //initialize previous scores to zero
    this.setState({
      prevScores : this.state.stateChallenges
          .map(function(a) {return {"name":a.name, "score":0}})
    })
  }

  prevScore(event){
    //lookup the previous score for this challenge
    return(this.state.prevScores
      .filter(function(score){
        return score.name === event})
      .map((score) =>
        score.score)
    )
  }

  //get the value of a checkbox
  cbxValue(event){
    return(
      //return zero if not checked
      event.target.checked === true ?
        this.state.stateChallenges
        .filter(function(challenge){
          return challenge.guid.toString() === event.target.id.toString()})
        .map((challenge) =>
          challenge.score
        )
        : 0
    )
  }

  handleClick(event) {
    const target = event.target.id.toString();

    //track which challenges have the full description toggled on
    if (event.target.value === "true") {
      this.setState(prevState => ({expandedItems:
         [...prevState.expandedItems, target]
       }))
    } else {
      this.setState(prevState => ({expandedItems:
         prevState.expandedItems.filter(
           expandedItem => expandedItem !== target
        )
      }));
    }
  }

  handleChange(event) {
    const name = event.target.name;

    //assign value depending on whether it is a checkbox vs other controls
    const aValue = event.target.type === 'checkbox' ? Number(this.cbxValue(event)) : Number(event.target.value);
    this.setState({[name]: aValue});

    //add new amount to current score
    this.setState(function(prevState){
      return{
        curScore: prevState.curScore = (Number(prevState.curScore) - this.prevScore(name) + aValue)
      }
    })

    //Update record of previous scores
    this.setState(function(prevState){
      return{
        prevScores: this.state.prevScores.map((score) =>
          score.name === name ? {"name":score.name, "score":aValue} : {"name":score.name, "score":score.score}
        )
      }
    })
  }

  render() {
    const aTitle = 'Hydro-Dynamics';
    const aDescription ="A calculator for the First Lego League (FLL) 2017/2018 HYDRO DYNAMICS robot game."
    const aLink = '//www.firstinspires.org/robotics/fll/challenge-and-season-info';
    return (
      <div className = "container">
        <NavBar curScore={this.state.curScore} />
        <PageHeader Title = {aTitle}
                Description = {aDescription}
                aLink = {aLink} />
        <div className = "row row-offcanvas row-offcanvas-right">
          <div className="col-xs-12 col-sm-9">
            <ChallengeList
                   challenges={this.state.stateChallenges}
                   expandedItems={this.state.expandedItems}
                   handleChange={this.handleChange}
                   handleClick={this.handleClick} />
          </div>
          <div>hi!</div>
          <Ad />
        </div>
      </div>
    )
  }
}

const App = () => {
  return(
    <BrowserRouter>
      <Switch>
        <Route exact path={`${process.env.PUBLIC_URL}/`} component={FLLChallengeCalc}></Route>
        <Route path={`${process.env.PUBLIC_URL}/about`} component={About}></Route>
        // <Route exact path="/" component={FLLChallengeCalc} />
        // <Route  path="/FLLCalculator" component={FLLChallengeCalc} />
        // <Route  path="/about" component={About} />
        // <Route  path="/FLLCalculator/about" component={About} />
        <Route render={() => <h1> Not found!</h1>} />
      </Switch>
    </BrowserRouter>
  )
}

export default App;
