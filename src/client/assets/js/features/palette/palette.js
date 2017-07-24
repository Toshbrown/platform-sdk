import { createStructuredSelector } from 'reselect';
import config from 'config';
import fetch from 'isomorphic-fetch'
import request from 'superagent'

const REQUEST_NODES  = 'iot.red/nodetypes/REQUEST_NODES';
const RECEIVE_NODES  = 'iot.red/nodetypes/RECEIVE_NODES';
const RECEIVE_CODE = 'iot.red/nodetypes/RECEIVE_CODE';
const LOAD_NODE =  'iot.red/nodetypes/LOAD_NODE';

export const NAME = 'palette';

const _categorise=(nodes)=>{
	return nodes.reduce((acc, node) => {
		acc[node.def.category] = acc[node.def.category] || [];
		acc[node.def.category].push(node);
		return acc;
	},{});
}


const _injectScript = (src)=>{
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.async = true;
    script.src = src;
    script.addEventListener('load', resolve);
    script.addEventListener('error', () => reject('Error loading script.'));
    script.addEventListener('abort', () => reject('Script loading aborted.'));
    document.head.appendChild(script);
  });
}

const initialState = {
  isFetching:false, 
  didInvalidate: false, 
  types:[], 
  categories:{},
}

export default function reducer(state = initialState, action) {

  switch (action.type) {

  	case  REQUEST_NODES:
	    return Object.assign({}, state, {
        	isFetching: true,
        	didInvalidate: false
      	})
	  
    //called when all of the node types have been recieved!
    case RECEIVE_NODES:
      	return Object.assign({}, state, {
      		isFetching: false,
        	didInvalidate: false,
        	types: action.nodes,
        	categories: _categorise(action.nodes),
      	});
    
    case LOAD_NODE:

        console.log("marvellous seen new node type come in!", action.node);
        console.log("current state categoreus us", state.categories);

        const nodesbycategory = state.categories[action.node.type] || {}

        return {
          ...state,
          categories: {
            
            ...state.categories,

            [action.node.type]:  [...nodesbycategory,action.node],
            
          }
        }

	default:
	    return state;
  }
}




//load up all of the nodes that are in the file returned by fetchNodes
const loadNodes = (json)=>{

   const nodes = [];

   json.nodes.forEach((node)=>{
      const n = require(`../../nodes/${node.file}.js`);
      console.log("-->I have node", n);
      nodes.push({component:n.default.node, name: n.default.type, def: n.default.def, reducer: n.default.reducer});
   });    

   return nodes;
}




//fetch the list of nodes that we want to load in the editor
function fetchNodes(store) {

  return function (dispatch, getState) {

    dispatch(requestNodes())

    return fetch(`${config.root}/nodes/nodes.json`,{
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
      .then(response => response.json())
      .then(function(json){
          const nodes = loadNodes(json);
          dispatch(receiveNodes(nodes));
      })
  }
}


function requestNodes() {
  return {
    type: REQUEST_NODES,
  }
}

function receiveNodes(nodes) {

  return function(dispatch, getState){
    dispatch({
      type: RECEIVE_NODES,
      nodes,
      receivedAt: Date.now()
    })
  }
}

function requestCode(){

  /*request
    .get(`${config.root}/lib/testbulb.js`)
    .buffer(true)
    .end(function(err,res){ 
      console.log(res.text);
      var fn  = new Function(res.text);
      console.log("fn is", fn());
    })*/

  return function (dispatch, getState) {


    _injectScript(`${config.root}/lib/testbulb.js`)
    .then(() => {
        console.log('Script loaded!');
        console.log(testbulb);
        dispatch({
          type: RECEIVE_CODE,
          receivedAt: Date.now()
        })
    }).catch(error => {
        console.log(error);
    });

    /*var head= document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type= 'text/javascript';
    script.src= `${config.root}/lib/testbulb.js`;
    script.async = true;
    script.onload = function(){
       console.log("nice --- script has loaded!!!");
       console.log(testbulb);
    };
    head.appendChild(lib);

    dispatch({
      type: RECEIVE_CODE,
      receivedAt: Date.now()
    })*/
  }
}

const palette = (state) => state[NAME];

export const selector = createStructuredSelector({
  palette
});

export const actionCreators = {
  fetchNodes, 
  requestCode,
};
