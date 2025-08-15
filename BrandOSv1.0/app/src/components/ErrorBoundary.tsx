import React from "react";
import { View, Text, Button } from "react-native";

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }>{
  constructor(props:any){
    super(props);
    this.state = { hasError:false, error:null };
  }
  static getDerivedStateFromError(error:any){
    return { hasError:true, error };
  }
  render(){
    if (this.state.hasError) {
      return (
        <View style={{flex:1, justifyContent:"center", padding:20}}>
          <Text>Something went wrong</Text>
          <Button title="Try Again" onPress={()=>this.setState({ hasError:false, error:null })} />
        </View>
      );
    }
    // @ts-ignore
    return this.props.children;
  }
}

