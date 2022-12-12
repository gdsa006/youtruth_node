let { 
    BrowserRouter,
    Switch,
    Route,
    Link,
    useRouteMatch,
    useParams
} = ReactRouterDOM ;

let Router = BrowserRouter ;

class Home extends React.Component {

    constructor(){
        super();
    }
    
    hello(p){
        console.log('hello', p)
    }
    render(){
        return(
            <button onClick={() => this.hello(1)}> Say Hello</button>
        )
    }
}

class About extends React.Component {

    constructor(){
        super();
    }
    
    hello(p){
        console.log('hello', p)
    }
    render(){
        return(
            <button onClick={() => this.hello(1)}> Say ABout</button>
        )
    }
}

class Contact extends React.Component {

    constructor(){
        super();
    }
    
    hello(p){
        console.log('hello', p)
    }
    render(){
        return(
            <button onClick={() => this.hello(1)}> Say Contact</button>
        )
    }
}

class Layout extends React.Component {
    render(){
        return (
            <Router>
                <div>
                    <ul>
                        <li>
                            <Link to="/react/">Home</Link>
                        </li>
                        <li>
                            <Link to="/react/about">About</Link>
                        </li>
                        <li>
                            <Link to="/react/contact">Contact</Link>
                        </li>
                    </ul>

                    <Switch>
                        <Route path="/react/about">
                            <About />
                        </Route>
                        <Route path="/react/contact">
                            <Contact />
                        </Route>
                        <Route path="/react/">
                            <Home />
                        </Route>
                    </Switch>
                    
                </div>
            </Router>
        )
    }
}

ReactDOM.render(<Layout />, document.getElementById('app'));